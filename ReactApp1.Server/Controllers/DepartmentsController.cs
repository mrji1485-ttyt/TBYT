using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTB.Server.Models;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace QLTB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Departments (Lấy danh sách)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Departments>>> GetDepartments()
        {
            // Sắp xếp theo ID giảm dần hoặc theo Tên tùy bạn
            return await _context.Departments
                .OrderBy(d => d.ID)
                .ToListAsync();
        }

        // 2. GET: api/Departments/5 (Lấy chi tiết 1 khoa)
        [HttpGet("{id}")]
        public async Task<ActionResult<Departments>> GetDepartment(short id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound(new { message = "Không tìm thấy khoa phòng này" });
            }

            return department;
        }

        // 3. POST: api/Departments (Thêm mới)
        [HttpPost]
        public async Task<ActionResult<Departments>> PostDepartment(Departments department)
        {
            // --- VALIDATION ---
            // 1. Kiểm tra trùng mã khoa phòng
            if (await _context.Departments.AnyAsync(d => d.DepartmentCode == department.DepartmentCode))
            {
                return BadRequest(new { message = $"Mã khoa '{department.DepartmentCode}' đã tồn tại!" });
            }

            // 2. Tự động lấy ID người tạo từ Token (nếu có claim UserId)
            var userIdClaim = User.FindFirst("UserId"); // Claim tên "UserId" phải khớp với bên AuthController
            if (userIdClaim != null && long.TryParse(userIdClaim.Value, out long uid))
            {
                department.CreatedByUserId = uid;
            }

            // 3. Gán thời gian tạo
            department.CreateAt = DateTime.Now;

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDepartment", new { id = department.ID }, department);
        }

        // 4. PUT: api/Departments/5 (Cập nhật)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDepartment(short id, Departments department)
        {
            if (id != department.ID)
            {
                return BadRequest(new { message = "ID dữ liệu không khớp" });
            }

            var existingDept = await _context.Departments.FindAsync(id);
            if (existingDept == null) return NotFound(new { message = "Không tìm thấy khoa phòng" });

            // --- VALIDATION SỬA ---
            // Nếu người dùng thay đổi Mã khoa -> Kiểm tra xem mã mới có trùng với khoa KHÁC không
            if (existingDept.DepartmentCode != department.DepartmentCode)
            {
                if (await _context.Departments.AnyAsync(d => d.DepartmentCode == department.DepartmentCode))
                {
                    return BadRequest(new { message = $"Mã khoa '{department.DepartmentCode}' đã tồn tại ở một bản ghi khác!" });
                }
            }

            // Cập nhật các trường thông tin
            existingDept.DepartmentCode = department.DepartmentCode;
            existingDept.FullName = department.FullName;
            existingDept.Description = department.Description;
            existingDept.IsActive = department.IsActive;

            // Không cập nhật CreateAt và CreatedByUserId khi sửa ---> cập nhật audit log
            // existingDept.CreateAt giữ nguyên

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Cập nhật thành công" });
        }

        // 5. DELETE: api/Departments/5 (Xóa)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(string departmentCode)
        {
            var department = await _context.Departments.FindAsync(departmentCode);
            if (department == null)
            {
                return NotFound(new { message = "Không tìm thấy khoa phòng để xóa" });
            }

            // --- KIỂM TRA RÀNG BUỘC DỮ LIỆU ---
            // Nếu khoa này đang có nhân viên -> Không cho xóa
            bool hasUsers = await _context.Users.AnyAsync(u => u.DepartmentCode == departmentCode);
            if (hasUsers)
            {
                return BadRequest(new { message = "Không thể xóa khoa này vì đang có nhân viên trực thuộc!" });
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa khoa phòng thành công" });
        }

        private bool DepartmentExists(short id)
        {
            return _context.Departments.Any(e => e.ID == id);
        }
    }
}

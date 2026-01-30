using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace QLTB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] //yêu cầu phải có Token mới gọi được
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            // Trả về danh sách nhưng KHÔNG trả về PasswordHash để bảo mật
            return await _context.Users
                .Select(u => new User
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    UserName = u.UserName,
                    DepartmentCode = u.DepartmentCode,
                    JobTitle = u.JobTitle,
                    PhoneNumber = u.PhoneNumber,
                    HisCodeAcc = u.HisCodeAcc
                })
                .ToListAsync();
        }

        // 2. GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        // 3. POST: api/Users (Thêm mới)
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // Kiểm tra trùng username
            if (await _context.Users.AnyAsync(u => u.UserName == user.UserName))
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại!" });
            }

            // Hash mật khẩu trước khi lưu
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = HashPassword(user.PasswordHash);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.Id }, user);
        }

        // 4. PUT: api/Users/5 (Cập nhật)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(long id, User user)
        {
            if (id != user.Id) return BadRequest();

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound();

            // Cập nhật thông tin
            existingUser.FullName = user.FullName;
            existingUser.HisCodeAcc = user.HisCodeAcc;
            existingUser.PhoneNumber = user.PhoneNumber;
            existingUser.DepartmentCode = user.DepartmentCode;
            existingUser.JobTitle = user.JobTitle;
            // Username thường không cho sửa, nếu muốn sửa thì uncomment dòng dưới
            // existingUser.Username = user.Username; 

            // Cập nhật mật khẩu nếu có
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                existingUser.PasswordHash = HashPassword(user.PasswordHash);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 5. DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(long id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        // Hàm Hash Password đơn giản (SHA256)
        private string HashPassword(string password)
        {
            try
            {
                return BCrypt.Net.BCrypt.HashPassword(password);
            }
            catch(Exception ex)
            {
                return string.Empty;
            }
        }

        // 6. GET: api/Users/me (Lấy thông tin chính mình từ Token - bảo mật hơn khi dùng ID để lấy thông tin)
        [HttpGet("me")]
        public async Task<ActionResult<User>> GetMe()
        {
            // Lấy Username từ trong Token (ClaimTypes.Name hoặc sub)
            var username = User.FindFirstValue("UserName");
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh trong Token" });
            }

            // Tìm user trong DB dựa theo username trong token
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại" });
            }

            // Trả về user (Không trả PasswordHash)
            return Ok(new User
            {
                Id = user.Id,
                FullName = user.FullName,
                UserName = user.UserName,
                DepartmentCode = user.DepartmentCode,
                JobTitle = user.JobTitle,
                PhoneNumber = user.PhoneNumber,
                HisCodeAcc = user.HisCodeAcc
            });
        }
    }
}
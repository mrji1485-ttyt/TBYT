using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Data;  // Cần namespace này để gọi ApplicationDbContext
using ReactApp1.Server.Models; // Cần namespace này để gọi User, Role
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactApp1.Server.Controllers
{
    // 1. DTO để hứng dữ liệu JSON từ React gửi lên
    public class LoginRequest
    {
        public required string Username { get; set; } // Bên React gửi "username" (là Mã HISCodeAcc)
        public required string Password { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 2. Khai báo biến để hứng Database và Cấu hình
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // 3. Constructor (Dependency Injection)
        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 4. API Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // --- LOGIC TRUY VẤN DATABASE ---
            var user = await _context.Users
                .Include(u => u.UserRoles)      // Kèm bảng trung gian
                .ThenInclude(ur => ur.Role)     // Kèm bảng Role để lấy tên quyền (Admin, TruongKhoa...)
                .FirstOrDefaultAsync(u => u.HisCodeAcc == request.Username);

            // Kiểm tra:
            // Lưu ý: Dùng BCrypt để verify mật khẩu đã mã hóa
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Sai Tên Đăng Nhập hoặc Mật Khẩu!" });
            }

            // Nếu đúng -> Tạo Token
            var token = GenerateJwtToken(user);


            // Trả về kết quả cho Frontend
            return Ok(new
            {
                token = token,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    hisCode = user.HisCodeAcc,
                    roles = user.UserRoles.Select(ur => ur.Role.Name).ToList()
                }
            });
        }

        // 5. Hàm tạo JWT Token (Private - chỉ dùng nội bộ class này)
        private string GenerateJwtToken(User user)
        {

            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);
            if (string.IsNullOrEmpty(jwtSettings["Key"]))
            {
                throw new InvalidOperationException("Lỗi cấu hình: Không tìm thấy 'Jwt:Key' trong file appsettings.json");
            }
            // Tạo danh sách Claims (Thông tin nhét vào vé thông hành)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("HisCodeAcc", user.HisCodeAcc),
                new Claim("UserName", user.UserName) // new Claim(ClaimTypes.Role, user.UserRoles)
            };

            // VÒNG LẶP QUAN TRỌNG: User có bao nhiêu quyền thì add bấy nhiêu dòng vào Token
            foreach (var userRole in user.UserRoles)
            {
                // Kiểm tra null để tránh lỗi nếu dữ liệu Role bị thiếu
                if (userRole.Role != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Code));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1), // Token sống 1 ngày
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // 6. API Phụ: Tạo nhanh User Admin để test 
        [HttpPost("seed-admin-user")]
        public async Task<IActionResult> SeedAdmin()
        {
            // Kiểm tra nếu có user rồi thì thôi
            if (await _context.Users.AnyAsync()) return BadRequest("Database đã có dữ liệu user.");

            // 1. Tạo User
            var adminUser = new User
            {
                FullName = "Quản Trị Viên Hệ Thống",
                HisCodeAcc = "ADMIN001", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                PhoneNumber = "0999999999",
                DepartmentCode = "CNTT",
                JobTitle = "IT Manager"
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync(); 

            // 2. Lấy Role Admin (Giả sử ID = 1 là Admin do Seed Data tạo)
            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Code == "Admin");

            if (adminRole != null)
            {
                // 3. Gán quyền Admin cho User này
                _context.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = adminRole.Id
                });
                await _context.SaveChangesAsync();
            }

            return Ok("Đã tạo user: ADMIN001 / mật khẩu: 123456 với quyền Admin");
        }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty; // 1. Tên

        [Required]
        [MaxLength(20)]
        public string HisCodeAcc { get; set; } = string.Empty; // 2. Mã HIS (Dùng làm Username đăng nhập luôn)
        [Required]
        [MaxLength(20)]
        public string UserName { get; set; } = string.Empty; // 2. Mã HIS (Dùng làm Username đăng nhập luôn)

        public string PasswordHash { get; set; } = string.Empty; // Bắt buộc phải có để login

        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty; // 3. Số điện thoại

        public string Department { get; set; } = string.Empty; // 4. Khoa/Phòng (Nên dùng DepartmentId nếu có bảng Khoa riêng)

        public string JobTitle { get; set; } = string.Empty; // 5. Vị trí làm việc

        // 6. Nhóm -> ĐÃ XÓA, thay bằng Relationship dưới đây
        public ICollection<UserRole> UserRoles { get; set; }
    }
}
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

        public string DepartmentCode { get; set; } = string.Empty; // 4. Khoa/Phòng 

        public string JobTitle { get; set; } = string.Empty; // 5. Vị trí làm việc
        public int DepartmentID { get; set; } 

        // 6. Nhóm -> ĐÃ XÓA, thay bằng Relationship dưới đây
        public ICollection<UserRole> UserRoles { get; set; }
        public int? CreatedByUserId { get; set; } // UserID người tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Ngày tạo
    }
}
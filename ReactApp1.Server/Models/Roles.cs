using ReactApp1.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models
{
    [Table("Roles")]
    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // Tên hiển thị (VD: Quản trị viên)

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } // Mã code (VD: ADMIN) - Dùng để lập trình

        [MaxLength(200)]
        public string Description { get; set; }

        public int? CreatedByUserId { get; set; } // UserID người tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Ngày tạo

        public bool IsActive { get; set; } = true; // Trạng thái hoạt động

        public ICollection<UserRole> UserRoles { get; set; }
    }
}


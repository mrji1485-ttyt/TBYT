using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QLTB.Server.Models
{
    [Table("Departments", Schema = "public")]
    [Index(nameof(DepartmentCode), IsUnique = true)]
    public class Departments
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Tự tăng
        public short ID { get; set; } // Dùng short (Int16) để khớp với cột DepartmentID (smallint) bên bảng Users

        [Required]
        [StringLength(50)] // Mã khoa phòng (VD: KHOA_NOI, P_IT...)
        public string DepartmentCode { get; set; }

        [Required]
        [StringLength(200)] // Tên đầy đủ
        public string FullName { get; set; }

        [StringLength(500)] // Mô tả (Cho phép null)
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true; // Mặc định là True (Đang hoạt động)

        public DateTime CreateAt { get; set; } = DateTime.Now; // Mặc định lấy giờ hiện tại

        // Lưu ID người tạo (Liên kết với bảng Users)
        public long? CreatedByUserId { get; set; }
    }
}
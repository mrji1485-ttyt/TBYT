
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTB.Server.Models
{
    [Table("AuditLogs", Schema = "public")]
    public class AuditLogs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long LogID { get; set; }

        // Người thực hiện (Cho phép null vì có thể là hành động của hệ thống hoặc khách vãng lai)
        public long? UserID { get; set; }

        [StringLength(50)]
        public string? Action { get; set; } // INSERT, UPDATE, DELETE, LOGIN, LOGOUT

        [StringLength(100)]
        public string? TableName { get; set; } // Users, Departments, Suppliers...

        [StringLength(50)]
        public string? RecordID { get; set; } // ID của dòng dữ liệu bị tác động

        // 👇 Quan trọng: Cấu hình kiểu jsonb cho Postgres
        [Column(TypeName = "jsonb")]
        public string? OldData { get; set; } // Lưu chuỗi JSON dữ liệu cũ

        [Column(TypeName = "jsonb")]
        public string? NewData { get; set; } // Lưu chuỗi JSON dữ liệu mới

        [StringLength(50)]
        public string? IPAddress { get; set; }

        // Thêm UserAgent nếu bạn muốn (như góp ý ở trên)
        [StringLength(500)]
        public string? UserAgent { get; set; } // thao tác từ trình duyệt gì? / mobile app?

        public DateTime Timestamp { get; set; } = DateTime.Now;
        public int status { get; set; } = 1; // 1: Thành công, 0: Thất bại.
    }
}
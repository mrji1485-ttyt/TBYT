using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models
{
    [Table("Suppliers")]
    public class Supplier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(20)]
        public string TaxCode { get; set; } // Mã số thuế

        [MaxLength(100)]
        public string ContactPerson { get; set; }

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } // Hotline kỹ thuật

        [MaxLength(100)]
        public string Email { get; set; } // Email nhận báo giá/báo hỏng

        [MaxLength(500)]
        public string Address { get; set; }

        public string Note { get; set; } // Ghi chú năng lực nhà thầu
        public int? CreatedByUserId { get; set; } // UserID người tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Ngày tạo
    }
}

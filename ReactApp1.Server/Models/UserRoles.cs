using ReactApp1.Server.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models
{
    [Table("UserRoles")]
    // [PrimaryKey(nameof(UserId), nameof(RoleId))] 
    public class UserRole
    {
        // Không cần cột ID riêng

        public int UserId { get; set; }
        public User User { get; set; }

        public int RoleId { get; set; } 
        public Role Role { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow; // Ngày cấp quyền
        public int? AssignedByUserId { get; set; } // Ai là người cấp quyền này? (Audit)
    }
}

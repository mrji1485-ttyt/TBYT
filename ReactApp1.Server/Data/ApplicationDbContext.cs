using Microsoft.EntityFrameworkCore;
using QLTB.Server.Models;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Departments> Departments { get; set; }
        public DbSet<AuditLogs> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình Khóa chính phức hợp (Composite Key) cho UserRoles
            // Nghĩa là: Cặp (UserId, RoleId) là duy nhất. 
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            // 2. Cấu hình quan hệ
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // 3. SEED DATA (Dữ liệu mẫu) - Đã cập nhật thêm cột Code
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = 1,
                    Name = "Quản trị hệ thống",
                    Code = "ADMIN",
                    Description = "Toàn quyền quản lý hệ thống"
                },
                new Role
                {
                    Id = 2,
                    Name = "Quản lý thiết bị",
                    Code = "QLTB",
                    Description = "Quản lý hồ sơ thiết bị, cập nhật bảo dưỡng"
                },
                new Role
                {
                    Id = 3,
                    Name = "Trưởng khoa",
                    Code = "TK",
                    Description = "Duyệt yêu cầu báo hỏng, đề xuất thanh lý"
                },
                new Role
                {
                    Id = 4,
                    Name = "Nhân viên y tế",
                    Code = "NV",
                    Description = "Sử dụng thiết bị, báo hỏng"
                }
            );
        }
    }
}
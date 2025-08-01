using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Notification
{
    [Key] public int NotificationId { get; set; }

    [ForeignKey("User")] 
    public int UserId { get; set; }
    public User User { get; set; }

    [MaxLength(255)] public string? Title { get; set; }

    public string? Message { get; set; }

    [MaxLength(50)] public string? Type { get; set; } //Delete, Update, Create, etc.

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    public int? RelatedObjectId { get; set; }

    public string? MappingUrl { get; set; }
}
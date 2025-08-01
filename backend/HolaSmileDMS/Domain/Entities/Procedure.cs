using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Procedure
{
    [Key]
    public int ProcedureId { get; set; }

    [MaxLength(200)]
    public string? ProcedureName { get; set; }
    

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public float? Discount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? OriginalPrice { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? ConsumableCost { get; set; }

    public float? ReferralCommissionRate { get; set; }
    public float? DoctorCommissionRate { get; set; }
    public float? AssistantCommissionRate { get; set; }
    public float? TechnicianCommissionRate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }

    public ICollection<SuppliesUsed> SuppliesUsed { get; set; }


}

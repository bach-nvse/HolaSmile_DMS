using Application.Constants;
using Application.Usecases.Dentist.CreateTreatmentProgress;
using Application.Usecases.Dentist.UpdateTreatmentProgress;
using Application.Usecases.Dentists.DeleteTreatmentProgress;
using Application.Usecases.Patients.ViewTreatmentProgress;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HDMS_API.Controllers;

[ApiController]
[Route("api/treatment-progress")]
public class TreatmentProgressController : ControllerBase
{
    private readonly IMediator _mediator;

    public TreatmentProgressController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET: api/TreatmentProgress/{treatmentRecordId}
    [HttpGet("{treatmentRecordId}")]
    public async Task<IActionResult> GetTreatmentProgressByRecordId(int treatmentRecordId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediator.Send(new ViewTreatmentProgressCommand(treatmentRecordId), cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = MessageConstants.MSG.MSG26
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                ex.Message
            });
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTreatmentProgressDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreateTreatmentProgressCommand { ProgressDto = dto });
            return Ok(new { message = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = MessageConstants.MSG.MSG26 });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Đã xảy ra lỗi không mong muốn.", detail = ex.Message });
        }
    }
    
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTreatmentProgressCommand command)
    {
        try
        {
            if (id != command.TreatmentProgressID)
                return BadRequest(new { message = MessageConstants.MSG.MSG16 });
    
            var result = await _mediator.Send(command);
            if (!result)
                return StatusCode(500, new { message = MessageConstants.MSG.MSG58 });
    
            return Ok(new { message = MessageConstants.MSG.MSG38 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = MessageConstants.MSG.MSG26
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Đã xảy ra lỗi không mong muốn.", detail = ex.Message });
        }
    }
    
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProgress(int id, CancellationToken cancellationToken)
    {
        try
        {
            var command = new DeleteTreatmentProgressCommand()
            {
                TreatmentProgressId = id
            };

            var result = await _mediator.Send(command, cancellationToken);

            return Ok(new
            {
                success = result,
                message = MessageConstants.MSG.MSG57
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new
            {
                message = MessageConstants.MSG.MSG27
            });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { message = MessageConstants.MSG.MSG26 });
        }
    }
}
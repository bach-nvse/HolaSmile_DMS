﻿using Application.Usecases.Assistants.DeactivePatientDentalImage;
using Application.Usecases.Assistants.ViewPatientDentalImage;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HDMS_API.Controllers
{
    [ApiController]
    [Route("api/patient-image")]
    public class ImageController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ImageController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Upload([FromForm] CreatePatientDentalImageCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetImages([FromQuery] int patientId, [FromQuery] int? treatmentRecordId, [FromQuery] int? orthodonticTreatmentPlanId)
        {
            try
            {
                var result = await _mediator.Send(new ViewPatientDentalImageCommand
                {
                    PatientId = patientId,
                    TreatmentRecordId = treatmentRecordId,
                    OrthodonticTreatmentPlanId = orthodonticTreatmentPlanId
                });

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> DeactiveImage(int imageId)
        {
            try
            {
                var result = await _mediator.Send(new DeactivePatientDentalImageCommand { ImageId = imageId });
                return Ok(new { message = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }



    }
}

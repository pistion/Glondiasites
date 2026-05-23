import { Body, Controller, Get, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequestWithContext } from '../../common/types/request-with-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('billing')
@Controller({ version: '1' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('billing/summary')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('billing:read')
  @ApiOkResponse({ description: 'Returns the current billing summary for the organization.' })
  summary(@Req() request: RequestWithContext) {
    return this.billingService.getSummary({
      userId: request.auth!.user.id,
      organizationId: request.auth!.organization.id,
      userEmail: request.auth!.user.email
    });
  }

  @Post('billing/checkout')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('billing:manage')
  @ApiCreatedResponse({ description: 'Creates a Stripe Checkout session URL.' })
  createCheckout(@Body() dto: CreateCheckoutDto, @Req() request: RequestWithContext) {
    return this.billingService.createCheckout(dto, {
      userId: request.auth!.user.id,
      organizationId: request.auth!.organization.id,
      userEmail: request.auth!.user.email
    });
  }

  @Post('billing/portal')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('billing:manage')
  @ApiCreatedResponse({ description: 'Creates a Stripe Billing Portal session URL.' })
  createPortal(@Req() request: RequestWithContext) {
    return this.billingService.createPortalSession({
      userId: request.auth!.user.id,
      organizationId: request.auth!.organization.id
    });
  }

  /** Raw-body endpoint — no JwtAuthGuard; uses Stripe signature verification instead. */
  @Post('provider-webhooks/stripe')
  @ApiOkResponse({ description: 'Handles incoming Stripe webhook events.' })
  stripeWebhook(
    @Req() request: RawBodyRequest<RequestWithContext>,
    @Headers('stripe-signature') signature: string
  ) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      return { received: false };
    }
    return this.billingService.handleStripeWebhook(rawBody, signature);
  }
}

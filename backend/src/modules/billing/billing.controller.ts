import { Body, Controller, Get, Headers, Post, Query, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequestWithContext } from '../../common/types/request-with-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { PayPalService } from './paypal.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('billing')
@Controller({ version: '1' })
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paypalService: PayPalService,
  ) {}

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

  // ─── PayPal endpoints ─────────────────────────────────────────────────────────

  /** Creates a PayPal subscription and returns the approval URL to redirect the user to. */
  @Post('billing/paypal/checkout')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('billing:manage')
  @ApiCreatedResponse({ description: 'Returns a PayPal approval URL for the selected plan.' })
  paypalCheckout(@Body() dto: CreateCheckoutDto, @Req() request: RequestWithContext) {
    return this.paypalService.createSubscription(dto.planKey, {
      userId: request.auth!.user.id,
      organizationId: request.auth!.organization.id,
      userEmail: request.auth!.user.email,
    });
  }

  /** Called after PayPal redirects back — activates the subscription in our DB. */
  @Post('billing/paypal/capture')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('billing:manage')
  @ApiCreatedResponse({ description: 'Activates a PayPal subscription after user approval.' })
  paypalCapture(
    @Query('subscription_id') subscriptionId: string,
    @Query('plan') planKey: string,
    @Req() request: RequestWithContext,
  ) {
    return this.paypalService.captureSubscription(subscriptionId, planKey, {
      userId: request.auth!.user.id,
      organizationId: request.auth!.organization.id,
    });
  }

  /** Raw-body endpoint — no JwtAuthGuard; uses PayPal signature verification instead. */
  @Post('provider-webhooks/paypal')
  @ApiOkResponse({ description: 'Handles incoming PayPal webhook events.' })
  async paypalWebhook(@Req() request: RawBodyRequest<RequestWithContext>, @Headers() headers: Record<string, string>) {
    const rawBody = request.rawBody;
    if (!rawBody) return { received: false };
    return this.paypalService.handleWebhook(headers, rawBody);
  }
}

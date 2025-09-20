import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getUserWallet(@Request() req) {
    return this.walletService.getUserWallet(req.user.id);
  }

  @Post('connect')
  async connectWallet(
    @Request() req,
    @Body() data: { walletAddress: string },
  ) {
    return this.walletService.connectWallet(req.user.id, data.walletAddress);
  }

  @Delete('disconnect')
  async disconnectWallet(@Request() req) {
    return this.walletService.disconnectWallet(req.user.id);
  }
}

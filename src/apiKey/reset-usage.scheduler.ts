import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';

@Controller('scheduler/reset-usage')
export class ResetUsageScheduler {
    constructor(
        private userService: UserService
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async resetDailyUsage() {
        await this.userService.allResetDailyUsage();
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async resetMonthlyUsage() {
        await this.userService.allResetMonthlyUsage();
    }
}
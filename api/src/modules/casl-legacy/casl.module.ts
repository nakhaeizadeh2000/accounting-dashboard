import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { CaslAbilityFactory } from './abilities/casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [CaslAbilityFactory, PoliciesGuard],
  exports: [CaslAbilityFactory, PoliciesGuard],
})
export class CaslModule { }

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { UserSearchDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async search(dto: UserSearchDto): Promise<Pagination<User>> {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.userRepository.createQueryBuilder('user')
            .orderBy('user.createdAt', 'DESC')

        if (dto?.roleList?.length > 0) {
            query.andWhere('user.role in (:roleList)', { roleList: dto.roleList })
        }

        const results = await paginate<User>(query, options);
        return results;
    }
}
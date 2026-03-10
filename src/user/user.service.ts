import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Brackets, Repository } from 'typeorm';
import { UserSearchDto, UserUpdateDto } from './user.dto';
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
        if (dto?.term != '') {
            query.andWhere(new Brackets(q => {
                q.orWhere('user.name like :keyword', { keyword: `%${dto.term}%` })
                q.orWhere('user.email like :keyword', { keyword: `%${dto.term}%` })
                q.orWhere('user.department like :keyword', { keyword: `%${dto.term}%` })
            }))
        }
        if (dto?.roles?.length > 0) {
            query.andWhere('user.role in (:...roles)', { roles: dto.roles })
        }

        const results = await paginate<User>(query, options);
        return results;
    }

    async delete(id: number) {
        return this.userRepository.delete(id);
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOneBy({ id })
    }

    async update(id: number, dto: UserUpdateDto): Promise<any> {
        const user = await this.findById(id);
        return await this.userRepository.save(Object.assign(user!, dto))
    }
}
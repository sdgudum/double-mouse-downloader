import IService from './IService';

const fns = {};

const configService: IService<typeof fns> = {
  name: 'config',
  fns,
};

export default configService;

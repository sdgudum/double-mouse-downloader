import axios from 'axios';

// TODO: 根据用户设置读取系统代理
const network = axios.create({
  headers: {
    'user-agent': 'Mozilla/5.0',
    referer: 'https://www.bilibili.com/',
  },
});

export default network;

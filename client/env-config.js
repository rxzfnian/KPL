// 环境配置文件
// 部署时请修改下面的地址

const config = {
  development: {
    API_URL: 'http://localhost:8080/api'
  },
  production: {
    // 部署到Koyeb后，将下面的地址替换为你的实际地址
    API_URL: 'https://YOUR_KOYEB_APP_NAME.koyeb.app/api'
  }
};

// 根据环境选择配置
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

console.log(`🌍 当前环境: ${env}`);
console.log(`🔗 API地址: ${currentConfig.API_URL}`);

module.exports = currentConfig;

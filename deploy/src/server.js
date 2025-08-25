const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// 配置CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// 读取CSV数据
function loadCSVData() {
  try {
    const csvPath = path.join(__dirname, '..', '..', 'data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // 跳过标题行，解析数据行
    const characters = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length >= 12) {
        const character = {
          name: columns[2] || columns[0], // 使用name列，如果没有则使用选手名称列
          team: columns[3] || '',
          team_h: columns[4] || '',
          ch: columns[5] || '0',
          ls: columns[6] || '0',
          FMVP: columns[7] || '0',
          state: columns[8] || '',
          position: columns[9] || '',
          birthDate: columns[10] || '',
          hero: columns[11] || ''
        };
        
        // 过滤有效数据
        if (character.name && character.name !== '数据未收录' && character.name.trim() !== '' && character.name !== '()') {
          characters.push(character);
        }
      }
    }
    
    console.log(`📊 CSV数据加载完成！共 ${characters.length} 条记录`);
    return characters;
  } catch (error) {
    console.error('❌ 读取CSV文件失败:', error.message);
    console.log('🔄 使用备用硬编码数据...');
    return getFallbackData();
  }
}

// 备用硬编码数据（原来的数据）
function getFallbackData() {
  return [
    {
      name: "一诺(徐必成)",
      team: "成都AG超玩会",
      team_h: "成都AG超玩会 BA黑凤梨",
      ch: "5",
      ls: "3",
      FMVP: "1",
      state: "在役",
      position: "发育路",
      birthDate: "20011226",
      hero: "公孙离"
    },
    {
      name: "钟意(陈家豪)",
      team: "成都AG超玩会",
      team_h: "成都AG超玩会 重庆狼队",
      ch: "5",
      ls: "2",
      FMVP: "2",
      state: "在役",
      position: "打野",
      birthDate: "20041226",
      hero: "镜 夏侯惇 裴擒虎 大司命"
    },
    {
      name: "长生(谢承峻)",
      team: "成都AG超玩会",
      team_h: "成都AG超玩会",
      ch: "5",
      ls: "2",
      FMVP: "1",
      state: "在役",
      position: "中路",
      birthDate: "20040420",
      hero: "王昭君"
    },
    {
      name: "大帅(孟家俊)",
      team: "成都AG超玩会",
      team_h: "成都AG超玩会",
      ch: "5",
      ls: "2",
      FMVP: "0",
      state: "在役",
      position: "游走",
      birthDate: "20031124",
      hero: "少司缘"
    },
    {
      name: "轩染(刘明)",
      team: "成都AG超玩会",
      team_h: "成都AG超玩会",
      ch: "5",
      ls: "2",
      FMVP: "0",
      state: "在役",
      position: "对抗路",
      birthDate: "20050516",
      hero: "姬小满 曹操"
    },
    {
      name: "Fly(彭云飞)",
      team: "济南RW侠",
      team_h: "重庆狼队 济南RW侠 QGhappy",
      ch: "8",
      ls: "4",
      FMVP: "7",
      state: "在役",
      position: "对抗路",
      birthDate: "20000923",
      hero: "关羽 花木兰 马超 狂铁 曜"
    },
    {
      name: "归期(双小钧)",
      team: "重庆狼队",
      team_h: "重庆狼队 昆山SC",
      ch: "2",
      ls: "1",
      FMVP: "0",
      state: "在役",
      position: "对抗路",
      birthDate: "20050323",
      hero: "关羽 姬小满 达摩 马超"
    },
    {
      name: "向鱼(蔡佑其)",
      team: "重庆狼队",
      team_h: "重庆狼队 广州TTG.XQ Qghappy",
      ch: "5",
      ls: "",
      FMVP: "0",
      state: "在役",
      position: "中路",
      birthDate: "20020723",
      hero: ""
    },
    {
      name: "小胖(李达亨)",
      team: "重庆狼队",
      team_h: "重庆狼队 QGhappy",
      ch: "5",
      ls: "",
      FMVP: "3",
      state: "在役",
      position: "打野",
      birthDate: "20040712",
      hero: ""
    },
    {
      name: "花海(罗思源)",
      team: "武汉EStarPro",
      team_h: "武汉EStarPro",
      ch: "7",
      ls: "",
      FMVP: "2",
      state: "退役",
      position: "打野",
      birthDate: "20010305",
      hero: ""
    },
    {
      name: "清融(黄垚钦)",
      team: "北京JDG",
      team_h: "武汉EStarPro 南通Hero久竞 北京JDG",
      ch: "7",
      ls: "",
      FMVP: "2",
      state: "在役",
      position: "中路",
      birthDate: "20031029",
      hero: ""
    },
    {
      name: "坦然(孙麟威)",
      team: "南通Hero久竞",
      team_h: "武汉EStarPro 南通Hero久竞",
      ch: "5",
      ls: "",
      FMVP: "2",
      state: "在役",
      position: "对抗路",
      birthDate: "20030920",
      hero: ""
    },
    {
      name: "子阳(向阳)",
      team: "苏州KSG",
      team_h: "武汉EStarPro 南通Hero久竞 苏州KSG",
      ch: "7",
      ls: "",
      FMVP: "1",
      state: "在役",
      position: "游走",
      birthDate: "20010213",
      hero: ""
    },
    {
      name: "九尾(许鑫蓁)",
      team: "南通Hero久竞",
      team_h: "广州TTG.XQ 杭州LGD.NBW 南通Hero久竞",
      ch: "0",
      ls: "0",
      FMVP: "0",
      state: "在役",
      position: "中路",
      birthDate: "20021122",
      hero: "不知火舞 王昭君 姜子牙"
    },
    {
      name: "钎城(周诣涛)",
      team: "深圳DYG",
      team_h: "广州TTG.XQ 深圳DYG",
      ch: "0",
      ls: "0",
      FMVP: "0",
      state: "在役",
      position: "发育路",
      birthDate: "20020207",
      hero: "鲁班七号 百里守约"
    },
    {
      name: "清清(吴金翔)",
      team: "广州TTG",
      team_h: "广州TTG.XQ 深圳DYG",
      ch: "2",
      ls: "2",
      FMVP: "0",
      state: "在役",
      position: "对抗路",
      birthDate: "20020626",
      hero: "关羽 老夫子"
    },
    {
      name: "小义(汪启俊)",
      team: "南通Hero久竞",
      team_h: "南通Hero久竞 深圳DYG",
      ch: "1",
      ls: "",
      FMVP: "1",
      state: "在役",
      position: "打野",
      birthDate: "20001203",
      hero: ""
    },
    {
      name: "阿豆(蒋涛)",
      team: "南通Hero久竞",
      team_h: "北京WB.TS 广州TTG.XQ 南通Hero久竞",
      ch: "2",
      ls: "",
      FMVP: "0",
      state: "在役",
      position: "游走",
      birthDate: "19980619",
      hero: ""
    },
    {
      name: "渡劫(谢祯城)",
      team: "济南RW侠",
      team_h: "济南RW侠",
      ch: "0",
      ls: "0",
      FMVP: "0",
      state: "退役",
      position: "对抗路",
      birthDate: "20010828",
      hero: "李信"
    },
    {
      name: "花云(张凯峰)",
      team: "济南RW侠",
      team_h: "济南RW侠",
      ch: "0",
      ls: "0",
      FMVP: "0",
      state: "退役",
      position: "发育路",
      birthDate: "20021006",
      hero: "公孙离 李元芳 伽罗"
    }
  ];
}

// 加载数据
const CHARACTERS_DATA = loadCSVData();

// 过滤有效数据
const validCharacters = CHARACTERS_DATA.filter(
  c => c.name && c.name !== '数据未收录' && c.name.trim() !== '' && c.name !== '()'
);

console.log(`✅ 数据加载完成！共 ${validCharacters.length} 条记录`);

// API路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataCount: validCharacters.length,
    message: '纯内存数据，无需数据库！'
  });
});

app.get('/api/random-character', (req, res) => {
  const randomIndex = Math.floor(Math.random() * validCharacters.length);
  const character = validCharacters[randomIndex];
  res.json(character);
});

app.get('/api/search', (req, res) => {
  const { query } = req.query;
  console.log(`🔍 搜索请求: query="${query}"`);
  
  if (!query || query.trim() === '') {
    console.log('✅ 搜索查询为空，返回所有有效数据');
    res.json(validCharacters);
    return;
  }
  
  const results = validCharacters.filter(character => 
    character.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);
  
  console.log(`✅ 搜索完成: 找到 ${results.length} 个结果`);
  console.log(`📝 结果:`, results.map(r => r.name));
  
  res.json(results);
});

app.get('/api/all-characters', (req, res) => {
  res.json(validCharacters);
});

// 启动服务器
const PORT = process.env.PORT || 8080;  // 修改默认端口为8080

app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 数据: ${validCharacters.length} 条记录 (内存存储)`);
  console.log(`✨ 无需数据库，纯内存运行！`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
}); 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Autocomplete,
  TextField,
  Table,
  
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { debounce } from 'lodash';

// Koyeb后端地址
const API_URL = process.env.REACT_APP_API_URL || 'https://unknown-ali-fpx2019-fd4b188c.koyeb.app/api';

const FIELDS = [
  'name', 'team', 'team_h', 'ch', 'FMVP', 'state', 'position', 'birthDate', 'hero'
];

// 新表头映射
const FIELD_LABELS = {
  name: 'ID(姓名)',
  team: '目前所在战队',
  team_h: '历史战队',
  ch: '冠军数',
  FMVP: 'FMVP数',
  state: '状态',
  position: '位置',
  birthDate: '年龄',
  hero: '擅长英雄'
};

// 需要数字比较的栏
const NUMBER_FIELDS = ['ch', 'FMVP', 'birthDate'];

function splitTags(str) {
  if (!str || str === '数据未收录') return ['数据未收录'];
  return str.trim().split(/\s+/);
}

// 计算年龄函数
function calcAge(birthDate) {
  if (!birthDate || birthDate === '数据未收录') return '数据未收录';
  
  // 确保日期格式正确（8位数字）
  if (!/^\d{8}$/.test(birthDate)) return '数据未收录';
  
  const year = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(4, 6));
  const day = parseInt(birthDate.substring(6, 8));
  
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age.toString();
}

// 添加数字比较函数
function compareNumbers(guess, target, field) {
  if (field === 'birthDate') {
    // 对于年龄，需要先计算实际年龄再比较
    const guessAge = parseInt(calcAge(guess[field]));
    const targetAge = parseInt(calcAge(target[field]));
    if (isNaN(guessAge) || isNaN(targetAge)) return '';
    if (targetAge > guessAge) return '↑';
    if (targetAge < guessAge) return '↓';
    return '';
  } else {
    // 对于其他数字字段（ch, FMVP）
    const guessNum = parseInt(guess[field]);
    const targetNum = parseInt(target[field]);
    if (isNaN(guessNum) || isNaN(targetNum)) return '';
    if (targetNum > guessNum) return '↑';
    if (targetNum < guessNum) return '↓';
    return '';
  }
}

// 修改表格单元格渲染逻辑
function renderTableCell(field, guess, target) {
  if (field === 'birthDate') {
    const isEqual = calcAge(guess[field]) === calcAge(target[field]);
    return (
      <TableCell key={field} align="center">
        <span style={isEqual ? { color: 'green', fontWeight: 'bold' } : {}}>
          {calcAge(guess[field])}
        </span>
        <span style={{ color: 'red', marginLeft: '2px' }}>
          {compareNumbers(guess, target, field)}
        </span>
      </TableCell>
    );
  } else if (field === 'ch' || field === 'FMVP') {
    const isEqual = guess[field] === target[field];
    return (
      <TableCell key={field} align="center">
        <span style={isEqual ? { color: 'green', fontWeight: 'bold' } : {}}>
          {guess[field]}
        </span>
        <span style={{ color: 'red', marginLeft: '2px' }}>
          {compareNumbers(guess, target, field)}
        </span>
      </TableCell>
    );
  } else {
    return (
      <TableCell key={field} align="center">
        {guess[field]}
      </TableCell>
    );
  }
}

function getTagChipProps(field, tag, guessTags, targetTags) {
  // 只要不是数字栏，且命中就绿色高亮
  if (!NUMBER_FIELDS.includes(field) && ((tag === '数据未收录' && targetTags.length === 1 && targetTags[0] === '数据未收录') || (tag !== '数据未收录' && targetTags.includes(tag)))) {
    return {
      sx: { backgroundColor: 'green', color: 'white', fontWeight: 'bold', fontSize: '0.95em' },
      variant: 'filled'
    };
  }
  return { sx: {}, variant: 'outlined' };
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [targetCharacter, setTargetCharacter] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogCharacter, setDialogCharacter] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchAllCharacters();
  }, []);

  const fetchAllCharacters = async () => {
    try {
      const response = await axios.get(`${API_URL}/search?query=`);
      const validCharacters = response.data.filter(
        c => c.name && c.name !== '数据未收录' && c.name.trim() !== '' && c.name !== '()'
      );
      console.log('validCharacters:', validCharacters.map(c => c.name));
      if (validCharacters.length > 0) {
        const randomIndex = Math.floor(Math.random() * validCharacters.length);
        setTargetCharacter(validCharacters[randomIndex]);
        setGuesses([]);
        setSearchQuery('');
        setSearchOptions([]);
      } else {
        setTargetCharacter(null);
        setGuesses([]);
        setSearchQuery('');
        setSearchOptions([]);
      }
    } catch (error) {
      console.error('Error fetching all characters:', error);
    }
  };

  // 使用防抖优化搜索
  const debouncedSearch = debounce(async (value) => {
    if (!value) {
      setSearchOptions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search?query=${value}&limit=20`);
      setSearchOptions(response.data.filter(
        c => c.name && c.name !== '数据未收录' && c.name.trim() !== '' && c.name !== '()'
      ));
    } catch (error) {
      setSearchOptions([]);
    }
    setLoading(false);
  }, 300);

  const handleInputChange = (_, value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleGuess = (character) => {
    setSearchQuery('');
    setSelectedOption(null);
    setSearchOptions([]);
    if (!targetCharacter) return;
    if (guesses.some(g => g.name === character.name)) {
      setSnackbar({ open: true, message: '不能重复猜测！' });
      return;
    }
    const newGuess = { ...character };
    setGuesses([...guesses, newGuess]);
    if (character.name === targetCharacter.name) {
      setDialogCharacter(targetCharacter);
      setIsWin(true);
      setOpenDialog(true);
    }
  };

  const handleSurrender = () => {
    setDialogCharacter(targetCharacter);
    setIsWin(false);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    fetchAllCharacters();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '' });
  };

  return (
    <Container maxWidth="md" sx={{ position: 'relative' }}>
      {/* 右上角信息 */}
      <Typography 
        variant="h6" 
        sx={{ 
          position: 'fixed', 
          top: 30, 
          right: 30, 
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          backgroundColor: 'red',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '3px solid black',
          zIndex: 9999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}
      >
        🎯 数据收录截止2025KPL春季赛 🎯
      </Typography>
      <Box sx={{ my: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={fetchAllCharacters}>
            新游戏
          </Button>
          <Button variant="contained" color="error" onClick={handleSurrender}>
            投降
          </Button>
        </Stack>
        <Box sx={{ mb: 4 }}>
          <Autocomplete
            freeSolo={false}
            options={searchOptions}
            getOptionLabel={option => option.name || ''}
            value={selectedOption}
            onChange={(_, value) => {
              if (value) handleGuess(value);
              setSelectedOption(null);
            }}
            inputValue={searchQuery}
            onInputChange={handleInputChange}
            loading={loading}
            filterOptions={x => x}
            disablePortal
            disabled={targetCharacter === null}
            renderInput={(params) => (
              <TextField {...params} label="输入姓名或id以选择选手：" fullWidth
                InputProps={{ ...params.InputProps, style: { fontSize: 14 } }}
                InputLabelProps={{ style: { fontSize: 14 } }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option._id} style={{ fontSize: 16, padding: 8 }}>
                {option.name}
              </li>
            )}
            open={!!searchQuery && searchOptions.length > 0}
          />
        </Box>

        {/* 猜测历史表格化 */}
        {guesses.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                猜测历史
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {FIELDS.map(field => (
                        <TableCell key={field} align="center" sx={{ fontWeight: 'bold', background: '#f5f5f5', fontSize: 14 }}>{FIELD_LABELS[field]}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {guesses.slice().reverse().map((guess, index) => (
                      <TableRow key={index}>
                        {FIELDS.map(field => {
                          if (NUMBER_FIELDS.includes(field)) {
                            return renderTableCell(field, guess, targetCharacter);
                          }
                          if (field === 'name') {
                            // 选手ID直接文本
                            return (
                              <TableCell key={field} align="center">
                                <span style={{ fontWeight: 'bold', fontSize: '1em' }}>{guess[field]}</span>
                              </TableCell>
                            );
                          }
                          if (field === 'team_h' || field === 'hero') {
                            // 历史战队、擅长英雄竖着排列
                            return (
                              <TableCell key={field} align="center">
                                <Stack direction="column" spacing={0.2} justifyContent="center" alignItems="center">
                                  {splitTags(guess[field]).map((tag, idx) => {
                                    const chipProps = getTagChipProps(field, tag, splitTags(guess[field]), splitTags(targetCharacter?.[field]));
                                    return (
                                      <Chip
                                        key={idx}
                                        label={tag}
                                        size="small"
                                        {...chipProps}
                                      />
                                    );
                                  })}
                                </Stack>
                              </TableCell>
                            );
                          }
                          // 其余栏用Chip高亮
                          return (
                            <TableCell key={field} align="center">
                              <Stack direction="row" spacing={0.3} justifyContent="center">
                                {splitTags(guess[field]).map((tag, idx) => {
                                  const chipProps = getTagChipProps(field, tag, splitTags(guess[field]), splitTags(targetCharacter?.[field]));
                                  return (
                                    <Chip
                                      key={idx}
                                      label={tag}
                                      size="small"
                                      {...chipProps}
                                    />
                                  );
                                })}
                              </Stack>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* 资料卡片弹窗 */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isWin ? '恭喜你猜对了！' : '谜底人物资料'}
          </DialogTitle>
          <DialogContent>
            {targetCharacter === null ? (
              <Typography color="error">没有可用选手，请检查数据！</Typography>
            ) : dialogCharacter && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>{dialogCharacter.name}</Typography>
                {FIELDS.slice(1).map(field => (
                  <Box key={field} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 'bold' }}>{FIELD_LABELS[field]}：</Typography>
                    {field === 'birthDate'
                      ? <Chip label={calcAge(dialogCharacter[field])} size="small" sx={{ mr: 0.5 }} />
                      : splitTags(dialogCharacter[field]).map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" sx={{ mr: 0.5 }} />
                        ))}
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} variant="contained">新游戏</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default App; 
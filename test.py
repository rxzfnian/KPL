
import tushare as ts
import pandas as pd


# 设置你的 TuShare Token
ts.set_token('0fd86c388ccdb04be2901499a1b5ce53efe0a31b28352870922e789400')  # 从 https://tushare.pro 注册并获取 Token
pro = ts.pro_api()

# 获取日线数据
a=input('股票代码')
b=input('开始日期')
c=input('截止日期')
d=input('初始金额')
d=float(d)
def compute_rsi(series, period=12):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi
def decide(a,b,c):
    df = pro.daily(ts_code=a, start_date=b, end_date=c)
    # 确保日期列是 datetime 类型
    df['trade_date'] = pd.to_datetime(df['trade_date'])
    # 按日期升序排列（如果数据是倒序的）
    df = df.sort_values(by='trade_date')
    # 计算五日均线和20日均线
    df['5_day_MA'] = df['close'].rolling(window=5).mean()
    df['20_day_MA'] = df['close'].rolling(window=20).mean()
    # 对数据按日期升序排序
    df['trade_date'] = pd.to_datetime(df['trade_date'])  # 确保日期列是 datetime 类型
    df = df.sort_values(by='trade_date')  # 按日期升序排序
    # 只返回五日均线和20日均线

    # 计算14日RSI
    df['rsi_12'] = compute_rsi(df['close'], period=12)

    # 返回包含日期、收盘价和RSI的DataFrame
    df[['trade_date', 'close', 'rsi_14']]
        
    # 返回包含日期、收盘价和 RSI 的 DataFrame（可选）
    # return df[['trade_date', 'close', 'rsi_12']]  # 如果只想看数据，可以保留这一行

    # 取最后两天的 RSI 值用于判断
    a1, close1, rsi1 = df[['trade_date', 'close', 'rsi_12']].iloc[-1]

    if rsi1 > 50:
        return '买入'
    else:
        return '等等'
def earn(a,b,c,d):
    df = pro.daily(ts_code=a, start_date=b, end_date=c)
    df['trade_date'] = pd.to_datetime(df['trade_date'])
    df = df.sort_values(by='trade_date')  # 日期升序
    df['5_day_MA'] = df['close'].rolling(window=5).mean()
    df['20_day_MA'] = df['close'].rolling(window=20).mean()
    df = df.dropna(subset=['5_day_MA', '20_day_MA'])  # 过滤 NaN
    profit=0
    amount = 0
    buy_price = 0
    for i in range (len(df)):
        decision = decide(a, b, df.iloc[i]['trade_date'].strftime('%Y%m%d'))
        if decision == '买入':
            past = df.iloc[i]
            amount = d // float(past['close'])  # 计算购买股票的数量
            print(f"买入: {past['trade_date']} - {past['close']} 元",amount)
        elif decision == '卖出' and amount > 0:
            price = df.iloc[i]
            profit += amount * (price['close'] - past['close'])  # 计算利润
            print(f"卖出: {price['trade_date']} - {price['close']} 元")
            amount = 0  # 清空持仓
        else:
            continue
    return profit
print(earn(a,b,c,d))



# 示例：工商银行
# TuShare 格式：沪市代码为 ".SH"，深市代码为 ".SZ"


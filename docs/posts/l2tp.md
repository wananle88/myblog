### Docker部署
```
services:
  softether-vpn:
    image: siomiz/softethervpn:alpine
    container_name: softether
    restart: always
    ports:
      - "443:443"       # SSTP使用的端口
      - "1194:1194/udp" # OpenVPN使用的端口
      - "500:500/udp"   # IPsec/IKE使用的端口
      - "4500:4500/udp" # IPsec NAT-T使用的端口
      - "1701:1701/udp" # L2TP使用的端口
    environment:
      - PSK=adminl2tpAAA          # 预共享密钥，用于IPsec连接
      - USERNAME=admin            # VPN用户名
      - PASSWORD=admin7890        # VPN密码
      - OPENVPN_ENABLE=1          # 启用OpenVPN
      - SSTP_ENABLE=1             # 启用SSTP
    cap_add:
      - NET_ADMIN
    volumes:
      - /lib/modules:/lib/modules
```

> 或者可以直接使用host网络模式：`network_mode: host`
> 部分协议不需要可以去掉

**L2TP多用户配置**
```
services:
  softether-vpn:
    image: siomiz/softethervpn:4.38-alpine
    container_name: l2tp
    restart: always
    ports:
      - "500:500/udp"
      - "4500:4500/udp"
      - "1701:1701/udp"
    environment:
      - PSK=adminl2tpAAA      # 预共享密钥
      - USERS=user1:password1;user2:password2;user3:password3  # 多用户配置
    cap_add:
      - NET_ADMIN
    volumes:
      - /lib/modules:/lib/modules
```

---
**电脑内置l2tp协议连接方法：**

1：搜索防火墙和网络保护，打开高级设置，打开出站规则，放行l2tp出站

2：电脑开始菜单搜索服务，打开服务后，查找`IPsec Policy Agent`设置启动类型为`自动`，系统默认是手动并且禁用的。

3：修改系统注册表。Win+R 运行，输入`regedit`后，打开系统注册表，注册表编辑器中，找到并单击以下注册表子项：
```
HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\Rasman\Parameters
```
4：然后找到子项`allowL2TPweakcryphto`，双击修改值为`1`。

5：然后在空白处新建，选择DWORD(32)值(D)，名称为：`ProhibitIpSec`，设置值为`1`。

6：以上步骤均完成后，重启计算机。

import socket
import time

import socket
import fcntl
import struct

def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,
        struct.pack('256s', ifname[:15])
    )[20:24])

try:
  source = get_ip_address('wlan0')
except:
  source = get_ip_address('eth0')

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind((source, 0))
s.connect(("8.8.8.8", 53))
me = s.getsockname()[0]
s.close()
print(me)


addresses = ["255.255.255.255", "192.168.0.255"]
BROADCAST_PORT = 4445

def create_socket(address):
  sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
  sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
  return (address, sock)

sockets = [create_socket(i) for i in addresses ]

while True:
  for address, sock in sockets:
    packet = ("livingdocuments-" + me)
    sock.sendto(packet.ljust(32), (address, BROADCAST_PORT))
  time.sleep(1.5)


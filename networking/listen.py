import socket, select

UDP_PORT = 4445

def create_socket(addr):
  network = socket.socket(socket.AF_INET, # Internet
                       socket.SOCK_DGRAM) # UDP
  network.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) 
  network.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1) 
  network.bind((addr, UDP_PORT))
  return network

sockets = map(create_socket, ['255.255.255.255', '192.168.0.255'])

while True:
  result = select.select(sockets,[],[])
  msg = result[0][0].recv(32) 
  print msg

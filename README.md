# ubuntu-server-app
## Aplicación en NodeJS + Express + MySQL2 que sirve de ejemplo para desplegarla junto a una DB MySQL en un Servidor Ubuntu (Dist Linux) 

# Pasos para instalar y probar un Ubuntu Server 24.02.2 en una máquina virtual (VM) mediante VirtualBox

## 1. Descargar e intalar VirtualBox [aquí](https://www.virtualbox.org/wiki/Downloads)
## 2. Descargar Ubuntu Server [aquí](https://ubuntu.com/download/server)
## 3. Crear una nueva VM en VB:
  ### 1. Nombre (Ubuntu_Server), selecciona la iso del Ubuntu Server descargada anteriormente y hacer click en "Skip Unattended Installation" (instalación guíada)
  ### 2. Añadir "Hardware":
    - Recomendaciones de Hardware para Servidor Ubuntu con MySQL
    | Carga de trabajo | Usuarios Concurrentes  | Uso esperado                                   | CPU             | RAM         | Almacenamiento              | Red        |
    |------------------|------------------------|------------------------------------------------|-----------------|-------------|-----------------------------|------------|
    | **Baja**         | 1-50                   | Pruebas, desarrollo, sitios con poco tráfico   | 2 núcleos       | 2-4 GB      | 50-100 GB SSD               | 1 Gbps     |
    | **Media**        | 50-200                 | Web apps pequeñas a medianas, ERP ligero       | 4 núcleos       | 8-16 GB     | 100-500 GB SSD/NVMe         | 1 Gbps     |
    | **Alta**         | 200-1000               | E-commerce, CRMs, apps empresariales           | 8 núcleos       | 32-64 GB    | 500 GB - 1 TB NVMe RAID 1   | 1-10 Gbps  |
    | **Muy alta**     | 1000+                  | SaaS, Big Data, OLTP intensivo                 | 16+ núcleos     | 128+ GB     | 1-4 TB NVMe RAID 10         | 10 Gbps+   |

    * RAM
    - MySQL se beneficia mucho de tener índices y datos en caché.
    - Para muchas lecturas, más RAM implica mejor rendimiento.
    - Recomendación: **2-3 veces el tamaño de la base de datos activa**.
    * Almacenamiento
      - Uso de **SSD mínimo**, preferiblemente **NVMe**.
      - Para escrituras intensas: RAID 1 (redundancia) o RAID 10 (rendimiento + redundancia).
      - Sistema de archivos recomendado: `ext4` o `xfs`.
    * Red
      - 1 Gbps suficiente para hasta ~500 usuarios concurrentes.
      - Para entornos de clúster o réplica, considerar 10 Gbps o superior.
    * CPU
      - MySQL usa múltiples hilos, pero algunas operaciones son de un solo hilo.
      - Recomendado: **alta frecuencia** para lecturas rápidas y **más núcleos** para muchas escrituras.
  ### 3. Entrar en "Parámetros - Red"
  - Las dos configuraciones más utilizas en VM's son "NAT" y "Adaptador puente":
    1. NAT: (Network Address Translation):
      - La VM comparte la conexión a Internet del host.
      - VirtualBox actúa como un router que da acceso a la VM.
      - La VM tiene una IP privada oculta para la red externa.
      - El acceso desde fuera hacia la VM no es posible por defecto (aunque se puede habilitar con reenvío de puertos).
    2. Adaptador puente:
      - La VM se conecta directamente a la red física como si fuera un equipo más.
      - Obtiene una IP del mismo rango que el host (por DHCP o manual).
      - La VM es visible en la red local y puede comunicarse directamente con otros dispositivos.
  - En nuestro caso para probar en una red local nuestro servidor con peticiones de clientes (otros PC's en esa red), utilizamos "Adaptador puente".
  ### 4. Iniciar la VM.
  1. Instalar Ubuntu server.
  2. Elegir idioma.
  3. Tipo de instalación "Ubuntu Server"
  4. Continuar sin red (luego configuramos la red una vez instalado el server). Esto ocurre al seleccionar "Adaptador puente".
  5. Seguir con "proxy" en blanco y "mirror" sin configurar.
  6. Seguir con utilización de todo el disco duro (dejar como está).
  7. Aceptar el resumen y "continuar".
  8. Crear un perfil de servidor (por ejemplo):
    - Nombre: Pepe
    - Nombre Servidor: cifo_violeta
    - Nombre de usuario: admin1234
    - Contraseña: admin1234
  9. Skip Ubuntu Pro
  10. Instalar Servidor OpenSSH (para conectarnos al server desde un cliente mediante un tunel con datos encriptados SSH). Para activar darle a "espacio" del teclado.
  11. Reiniciar. Dará un fallo de "cdrom". Dar a "intro". Se intenta conectar, pero al no haber conexión, esperamos.
## 4. Configurar IP en nuestro server para tener conexión de red en modo "adaptador puente":
  1. Entrar con nuestras credenciales y ponernos como usuario administrador "root":
     ``` sudo -i ```
  2. Abrir el archivo con el editor "nano":
      ``` nano /etc/netplan/50-cloud-init.yaml ```
  3. Añadir este texto (indentado). Los rangos de IP son los que tenemos en clase que nos proporciona la red local (mirar en CMD del PC host (real) añadiendo "ipconfig).
     ```
     network:
      version: 2
      ethernets:
        enp0s3:
          dhcp4: false
          addresses:
            - 10.199.160.199/24
          routes:
            -to: default
             via: 10.199.160.254
          nameservers:
            addresses:
              - 8.8.8.8
              - 1.1.1.1
     ```
     4. Guardar el archivo y modificar sus permisos y aplicar cambios:
        ```
        chmod 600 /etc/netplan/50-cloud-init.yaml
        sudo netplan apply
        ```
     5. Probar que tenemos conexión mediante este comando:
        ```
        sudo apt update
        ```  
## 5. Probar conexión SSH mediante un cliente (otro PC de clase). Añadir en siguiente comando en el CMD de un PC y con los datos de acceso que hemos añadido en la instalación del server inicial. Una vez dentro es lo mismo que estar en el terminal de servidor de Ubuntu:
   ```
    ssh admin1234@10.199.160.199
   ```  

## 6. Instalar MySQL server y ver estados:
  ```
  sudo apt update
  sudo apt install mysql-server
  ```  
  - Comandos de estado de MySQL Server:
     ```
    sudo systemctl status mysql
    sudo systemctl restart mysql
    sudo systemctl start mysql
    sudo systemctl stop mysql
    ```
## 7. Crear un usuario administrador y entrar desde un cliente mediante MySQL Workbench:
  1. Entrar en mysql:
     ``` sudo mysql ```
  2. Crear un usuario:
     ```
     CREATE USER 'admin1234'@'%' IDENTIFIED BY 'admin1234';
     GRANT ALL PRIVILEGES ON *.* TO 'admin1234'@'%' WITH GRANT OPTION;
     ```
  3. Permitir conexiones externas en MySQL. Edita el archivo de configuración:
     ```
     sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
     ```
      Busca esta línea: bind-address = 127.0.0.1
      Y cámbiala a: bind-address = 0.0.0.0
      Luego reinicia MySQL:
     ```
     sudo systemctl restart mysql
     ```
  4. Conectar con MySQL Workbench con los datos de acceso que hemos creado. El puerto es 3306 por defecto.
  5. Ya tenemos un servidor MySQL! :)

## 8. Crear un servidor para poder deplegar apps en NodeJS:
  1. Instalar nodejs y npm:
     ```
     sudo apt install nodejs
     sudo apt install npm
     ```
  2. Clonar el repositorio de prueba de clase desarrollado con NodeJS, Express y MySQL
     ```
     git clone https://github.com/IFCD0111-CIFO-VIOLETA-24-25/ubuntu-server-app.git
     ```
  3. Entrar en el proyecto, instalar dependencias y arrancar el server (previamente crear la base de datos "pruebaDB"):
     ```
     cd ubuntu-server-app
     npm i
     node server
     ```
  4. Desde cualquier cliente en el navegador puedes probar la siguiente ruta:
      ``` http://10.199.160.199/hello  ```

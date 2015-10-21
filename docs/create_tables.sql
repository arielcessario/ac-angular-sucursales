
# SUCURSALES
CREATE TABLE sucursales (
  sucursal_id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  direccion varchar(150) NOT NULL,
  telefono varchar(45) DEFAULT NULL,
  PRIMARY KEY (sucursal_id)
) ENGINE=MyISAM AUTO_INCREMENT=68 DEFAULT CHARSET=utf8;


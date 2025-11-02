CREATE DATABASE  IF NOT EXISTS `ingswbd` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ingswbd`;
-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ingswbd
-- ------------------------------------------------------
-- Server version	8.0.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `destino`
--

DROP TABLE IF EXISTS `destino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destino` (
  `id_destino` int NOT NULL,
  `usuario_destino` int DEFAULT NULL,
  `nombre_destino` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_destino`),
  KEY `usuariosdestinos_idx` (`usuario_destino`),
  CONSTRAINT `usuariosdestinos` FOREIGN KEY (`usuario_destino`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destino`
--

LOCK TABLES `destino` WRITE;
/*!40000 ALTER TABLE `destino` DISABLE KEYS */;
/*!40000 ALTER TABLE `destino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egreso`
--

DROP TABLE IF EXISTS `egreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egreso` (
  `id_egreso` int NOT NULL,
  `usuarios` int DEFAULT NULL,
  `tipo_egreso` int DEFAULT NULL,
  `cantidad` float DEFAULT NULL,
  `periocidad_inicial` datetime DEFAULT NULL,
  `periocidad_final` datetime DEFAULT NULL,
  PRIMARY KEY (`id_egreso`),
  KEY `egreso_idx` (`usuarios`),
  KEY `tipoegreso_idx` (`tipo_egreso`),
  CONSTRAINT `egreso` FOREIGN KEY (`usuarios`) REFERENCES `usuario` (`idusuario`),
  CONSTRAINT `tipoegreso` FOREIGN KEY (`tipo_egreso`) REFERENCES `tipoegreso` (`idtipoegreso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egreso`
--

LOCK TABLES `egreso` WRITE;
/*!40000 ALTER TABLE `egreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `egreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingreso`
--

DROP TABLE IF EXISTS `ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingreso` (
  `idingreso` int NOT NULL,
  `idusuarios` int DEFAULT NULL,
  `tipoi` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `periocidad i` datetime DEFAULT NULL,
  `periocidadF` datetime DEFAULT NULL,
  PRIMARY KEY (`idingreso`),
  KEY `ingreso_idx1` (`idingreso`),
  KEY `usuarios_idx` (`idusuarios`),
  KEY `ingreso_idx` (`tipoi`),
  CONSTRAINT `ingresos` FOREIGN KEY (`tipoi`) REFERENCES `tipoingreso` (`idtipoingreso`),
  CONSTRAINT `usuarios` FOREIGN KEY (`idusuarios`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingreso`
--

LOCK TABLES `ingreso` WRITE;
/*!40000 ALTER TABLE `ingreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inversiones`
--

DROP TABLE IF EXISTS `inversiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inversiones` (
  `idinversiones` int NOT NULL,
  `ineversionesusuarios` int DEFAULT NULL,
  `destinos` int DEFAULT NULL,
  `montoi` float DEFAULT NULL,
  `destinoinversion` varchar(200) DEFAULT NULL,
  `periodoinicial` datetime DEFAULT NULL,
  `periodofinal` datetime DEFAULT NULL,
  `interes` float DEFAULT NULL,
  PRIMARY KEY (`idinversiones`),
  KEY `usuariosinversionistas_idx` (`ineversionesusuarios`),
  KEY `destinosinversiones_idx` (`destinos`),
  CONSTRAINT `destinosinversiones` FOREIGN KEY (`destinos`) REFERENCES `destino` (`id_destino`),
  CONSTRAINT `usuariosinversionistas` FOREIGN KEY (`ineversionesusuarios`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inversiones`
--

LOCK TABLES `inversiones` WRITE;
/*!40000 ALTER TABLE `inversiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `inversiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas`
--

DROP TABLE IF EXISTS `metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas` (
  `idmetas` int NOT NULL,
  `metasusuarios` int DEFAULT NULL,
  `fechainicio` date DEFAULT NULL,
  `fechafinal` datetime DEFAULT NULL,
  `ahorrototalreal` float DEFAULT NULL,
  `ahorrototalmeta` float DEFAULT NULL,
  `fechainsercion` date DEFAULT NULL,
  `fechaactualizacion` date DEFAULT NULL,
  `fechaeliminacion` datetime DEFAULT NULL,
  `metaactiva` int DEFAULT NULL,
  PRIMARY KEY (`idmetas`),
  KEY `metasusuarios_idx` (`metasusuarios`),
  CONSTRAINT `metasusuarios` FOREIGN KEY (`metasusuarios`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas`
--

LOCK TABLES `metas` WRITE;
/*!40000 ALTER TABLE `metas` DISABLE KEYS */;
/*!40000 ALTER TABLE `metas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prosedencia`
--

DROP TABLE IF EXISTS `prosedencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prosedencia` (
  `idprosedencia` int NOT NULL,
  `usariosprosedencia` int DEFAULT NULL,
  `nombreprosedencia` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idprosedencia`),
  KEY `prosedencia_idx` (`usariosprosedencia`),
  CONSTRAINT `prosedencia` FOREIGN KEY (`usariosprosedencia`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prosedencia`
--

LOCK TABLES `prosedencia` WRITE;
/*!40000 ALTER TABLE `prosedencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `prosedencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recompensas`
--

DROP TABLE IF EXISTS `recompensas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recompensas` (
  `idrecompensas` int NOT NULL,
  `recompensausuario` int DEFAULT NULL,
  `tipor` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idrecompensas`),
  KEY `recompensas_idx` (`recompensausuario`),
  CONSTRAINT `recompensas` FOREIGN KEY (`recompensausuario`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recompensas`
--

LOCK TABLES `recompensas` WRITE;
/*!40000 ALTER TABLE `recompensas` DISABLE KEYS */;
/*!40000 ALTER TABLE `recompensas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipoegreso`
--

DROP TABLE IF EXISTS `tipoegreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoegreso` (
  `idtipoegreso` int NOT NULL,
  `tipoegresocol` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idtipoegreso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipoegreso`
--

LOCK TABLES `tipoegreso` WRITE;
/*!40000 ALTER TABLE `tipoegreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipoegreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipoingreso`
--

DROP TABLE IF EXISTS `tipoingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoingreso` (
  `idtipoingreso` int NOT NULL,
  `tipodeingreso` varchar(13) DEFAULT NULL,
  PRIMARY KEY (`idtipoingreso`),
  KEY `ingreso_idx` (`tipodeingreso`),
  KEY `ingreso_idx1` (`idtipoingreso`),
  CONSTRAINT `ingreso` FOREIGN KEY (`idtipoingreso`) REFERENCES `ingreso` (`idingreso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipoingreso`
--

LOCK TABLES `tipoingreso` WRITE;
/*!40000 ALTER TABLE `tipoingreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipoingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idusuario` int NOT NULL,
  `Bandera` int DEFAULT NULL,
  `FechaI` datetime DEFAULT NULL,
  `UltimaAct` datetime DEFAULT NULL,
  `Nombre` varchar(45) DEFAULT NULL,
  `apellidoP` varchar(45) DEFAULT NULL,
  `apellidoM` varchar(45) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `fechaN` date DEFAULT NULL,
  `contraseña` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idusuario`),
  KEY `usuario_idx` (`idusuario`),
  CONSTRAINT `usuario` FOREIGN KEY (`idusuario`) REFERENCES `ingreso` (`idingreso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ingswbd'
--

--
-- Dumping routines for database 'ingswbd'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15  8:56:59

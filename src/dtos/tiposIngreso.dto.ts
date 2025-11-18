import { IsString, IsOptional, IsBoolean, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearTipoIngresoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
}

export class ActualizarTipoIngresoDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
}

export class ListarTiposIngresoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El tamaño de página debe ser un número entero' })
  @Min(1, { message: 'El tamaño de página debe ser mayor a 0' })
  tamanoPagina?: number = 20;

  @IsOptional()
  @IsString({ message: 'El orden debe ser una cadena de texto' })
  orden?: string = 'nombre:asc';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activo?: boolean;
}
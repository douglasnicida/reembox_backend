import { IsNotEmpty } from "class-validator"

export class CreateCostCenterDto {
    @IsNotEmpty({ message: "Descrição é obrigatória" })
    description: string

    active?: boolean
}

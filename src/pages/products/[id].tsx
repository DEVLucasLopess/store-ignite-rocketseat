import { useRouter } from "next/router"

export default function Products() {
    //Hook do next atraves do query eu consigo te acesso ao id passado na rota
    const { query } = useRouter()

    return (
        <>
            <h1>
                Minha página de produtos
            </h1>
        </>
    )
}
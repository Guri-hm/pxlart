import Link from 'next/link'

const Footer = () => {
    return (
        <footer>
            <div>
                <p>©{new Date().getFullYear()} Meguru Hanai</p>
            </div>
        </footer>
    )
}

export default Footer
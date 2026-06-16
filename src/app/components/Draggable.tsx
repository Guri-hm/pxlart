import { useDraggable } from "@dnd-kit/core";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import NonogramQr from '../components/NonogramQr';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import StarIcon from '@mui/icons-material/Star';
import { yellow } from '@mui/material/colors';

const icons = [
    <SentimentVerySatisfiedIcon sx={{ color: '#8bc34a' }} key={0} />,
    <SentimentNeutralIcon sx={{ color: '#2196f3' }} key={1} />,
    <SentimentVeryDissatisfiedIcon sx={{ color: '#FF0000' }} key={2} />,
];
type Props = {
    item: Nonogram,
}

type Nonogram = {
    title: string,
    answer: string,
    uuid: string,
    created_at: string,
    id: number,
    view_count: number,
    evaluation: number,
    delete_flag: number
}

const formatDate = (date: Date, sep = "") => {
    date.setTime(date.getTime() - 1000 * 60 * 60 * 9);
    return date.getFullYear() + sep + ('00' + (date.getMonth() + 1)).slice(-2) + sep + ('00' + date.getDate()).slice(-2)
}

export const Draggable = (params: Props) => {
    // useDraggableを使って必要な値をもらう
    const {
        setNodeRef,
        listeners,
        attributes,
        transform,
        isDragging
    } = useDraggable({
        id: params.item.id,
        data: {
            uuid: params.item.uuid,
        }
    });

    const transformStyle = transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined;
    const uri = typeof window !== 'undefined' ? new URL(window.location.href) : undefined;

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: transformStyle,
                height: "fit-content",
                touchAction: 'none'
            }}
        >
            <Card sx={{
                cursor: isDragging ? "grabbing" : "grab",
                opacity: isDragging ? 0.5 : undefined,
            }}>
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div" mb="5">
                        {params.item.title == null ? "タイトルなし" : params.item.title} {params.item.delete_flag == 1 ? "" : <StarIcon sx={{ color: yellow[500] }} />}
                    </Typography>
                    <Typography variant="inherit" component="div" color="text.secondary">
                        作成日:{formatDate(new Date(params.item.created_at), "/")}<br />
                        <Stack direction="row" alignItems="center">
                            むずかしさ:{icons[params.item.evaluation]}
                        </Stack>
                        閲覧数:{(params.item.view_count)}
                    </Typography>

                </CardContent>
                <CardActions>
                    <Link href={`${process.env.root}/nonogram/${params.item.uuid}`} sx={{ marginLeft: '10px' }}>遊ぶ</Link>|
                    {uri && (
                        <NonogramQr url={`${uri.origin}${process.env.root}/nonogram/${params.item.uuid}`}></NonogramQr>
                    )}
                </CardActions>
            </Card>
        </div >
    );
};
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function FileButton(props: any) {
    return (

        <IconButton aria-label="upload" component="label">
            <props.icon></props.icon>
            <VisuallyHiddenInput
                accept="image/*"
                id={`upload-button-${props.name}`}
                name={props.name}
                multiple
                type="file"
                onChange={props.onChange}
                className={props.className}
            >
            </VisuallyHiddenInput>
        </IconButton>

    );
};
import { createSvgIcon } from '@mui/material/utils';

const CreateSvgIcon = createSvgIcon(
    <svg xmlns="http://www.w3.org/2000/svg" x="0px"
        y="0px" width="15.988px" height="15.988px" viewBox="0 0 15.988 15.988" enableBackground="new 0 0 15.988 15.988">
        <path fill="none" stroke="#000000" strokeWidth="0.7804" strokeMiterlimit="10" d="M8.115,1.9v2.799" />
        <path d="M4.748,4.208l3.365,2.897l3.369-2.897H4.748z" />
        <path enableBackground="new    " d="M13.824,7.404h-6.22c-0.005,0-0.009-0.003-0.014-0.003H2.409c-0.569,0-1.036,0.467-1.036,1.038
	v4.144h0.016v1.056c0,0.567,0.466,1.035,1.036,1.035h11.399c0.566,0,1.033-0.466,1.033-1.035v-1.056V9.359V8.438
	C14.857,7.87,14.39,7.404,13.824,7.404z M11.752,8.439h2.07v2.072h-2.07V9.359V8.439z M8.642,8.439h2.07v0.92v0.353v0.8h-2.07V9.359
	V8.439z M7.59,8.439v1.036v1.036H5.533V9.359H5.532v-0.92H7.59z M4.482,8.439v2.072H2.425V9.359H2.41v-0.92H4.482z M2.425,13.636
	v-2.072h2.056v1.019h0.016v1.054H2.425z M5.533,13.636v-2.072H7.59v1.019h0.015v1.054H5.533z M10.713,13.636h-2.07v-1.054v-1.019
	h2.07v1.019V13.636z M13.824,13.636h-2.072v-1.054v-1.019h2.07v1.019h0.002V13.636z"/>
    </svg>,
    'Pixelize',
);

export default function PixelizeIcon() {
    return (
        <>
            <CreateSvgIcon />
        </>
    );
}
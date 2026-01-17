import { useCursor } from '@/app/context/CursorContext';

export function useCursorInteraction() {
    const { setCursorText } = useCursor();

    const bind = (text: string) => ({
        onMouseEnter: () => setCursorText(text),
        onMouseLeave: () => setCursorText(""),
    });

    return { setCursorText, bind };
}

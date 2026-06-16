import { useDroppable } from "@dnd-kit/core";
import { FC } from "react";
import Image from 'next/image'
import styles from './droppable.module.css'

type DroppableProp = {
  id: string
};

export const Droppable: FC<DroppableProp> = ({ id }) => {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id
  })

  return (
    <>
      <Image ref={setNodeRef}
        src={`/images/gomibako${isOver ? '' : '_futa'}.svg`}
        className={styles.img}
        width={100}
        height={100}
        alt="gomibako"
      />
    </>
  )
}
import Button from "@/shared/ui/button.tsx";


type Props = {
    onDelete: () => Promise<void> | void;
    loading?: boolean;
};

export default function DeleteArticleButton({
    onDelete,
    loading = false,
}: Props) {
    return (
        <Button
           type="button"
           loading={loading}
           onClick={onDelete}
           className="bg-red-500 hover:bg-red-600"
        >
            Delete Article
        </Button>
    )
}
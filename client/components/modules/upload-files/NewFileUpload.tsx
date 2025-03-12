import AddFileIcon from './icons/AddFileIcon';

export type NewFileUploadsProps = {
  type?: 'multiple' | 'single';
};

const NewFileUpload = ({ type = 'single' }: NewFileUploadsProps) => {
  return (
    <div className="flex h-[13.75rem] w-[25rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-200">
      <div className="flex h-3/4 w-full flex-col items-center justify-center gap-4">
        <AddFileIcon width={45} height={45} />
        <p className="text-xl leading-[1.125rem] text-neutral-400">click or drop file to upload</p>
      </div>
      <div className="flex h-1/4 w-full items-center justify-center bg-green-200"></div>
    </div>
  );
};

export default NewFileUpload;

import { useEffect, useState, type FC } from 'react';
import { UploadForm } from '../upload-form';
import { Loader } from '../ui/loader';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { fetchEventSource } from '@ai-zen/node-fetch-event-source';

type ReviewItem = {
  result: boolean;
  explanation: string;
};

export const IndexPage: FC = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>();
  const [file, setFile] = useState<File | null>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const abortController = new AbortController();

    void fetchEventSource('/api/reviews', {
      body: formData,
      method: 'POST',
      onmessage: (event) => {
        setReviewItems((items) => [...(items ?? []), JSON.parse(event.data)]);
      },
      onclose: () => {
        setLoading(false);
      },
      onerror: (error) => {
        toast({ title: 'An error occurred', description: error?.message, variant: 'destructive' });
      },
      signal: abortController.signal,
      openWhenHidden: true,
    });

    return () => {
      abortController.abort();
      setReviewItems([]);
    };
  }, [file]);

  return (
    <div>
      <UploadForm
        onSubmit={async ({ file }) => {
          setLoading(true);
          setReviewItems([]);
          setFile(file);
        }}
      />

      <div className="m-auto mt-2 max-w-[500px] p-2">
        <Accordion type="multiple">
          {reviewItems?.map((item, idx) => (
            <AccordionItem value={`item=${idx}`} key={idx}>
              <AccordionTrigger className="hover:no-underline">
                ({item.result ? '✅' : '❌'}) {idx + 1} task
              </AccordionTrigger>
              <AccordionContent>{item.explanation}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {loading ? (
          <div className="mt-3">
            <Loader />
          </div>
        ) : null}
      </div>
    </div>
  );
};

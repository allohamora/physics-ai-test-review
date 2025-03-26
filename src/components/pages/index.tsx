import { useState, type FC } from 'react';
import { UploadForm } from '../upload-form';
import { Loader } from '../ui/loader';
import { actions } from 'astro:actions';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { INDEX_PAGE } from '@/i18n/content';

type ReviewItem = {
  result: boolean;
  explanation: string;
};

export const IndexPage: FC = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <div>
      <UploadForm
        onSubmit={async ({ file }) => {
          const formData = new FormData();
          formData.append('file', file);

          setLoading(true);
          const { data, error } = await actions.makeReview(formData);

          if (error) {
            toast({ title: INDEX_PAGE.AN_ERROR_OCCURRED, description: error.message, variant: 'destructive' });
          } else {
            setReviewItems(data);
          }

          setLoading(false);
        }}
      />

      <div className="m-auto mt-2 max-w-[500px] p-2">
        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <Accordion type="multiple">
            {reviewItems?.map((item, idx) => (
              <AccordionItem value={`item=${idx}`} key={idx}>
                <AccordionTrigger className="hover:no-underline">
                  ({item.result ? '✅' : '❌'}) {idx + 1} {INDEX_PAGE.TASK.toLowerCase()}
                </AccordionTrigger>
                <AccordionContent>{item.explanation}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

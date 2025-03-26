import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowUp } from 'lucide-react';
import { Input } from './ui/input';
import type { FC } from 'react';
import { UPLOAD_FORM } from '@/i18n/content';

const FormSchema = z.object({
  file: z.instanceof(File),
});

export type UploadFormProps = {
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
};

export const UploadForm: FC<UploadFormProps> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
  });

  return (
    <div className="flex items-center justify-center pt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[500px]">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-5">
                  <FormLabel className="block text-center text-3xl">{UPLOAD_FORM.FILE}</FormLabel>
                  <div className="flex space-x-2 rounded-md">
                    <FormControl>
                      <Input
                        placeholder={UPLOAD_FORM.FILE_PLACEHOLDER}
                        className="max-w-[500px] resize-none ring-0"
                        accept=".docx"
                        multiple={false}
                        type="file"
                        onChange={(e) => {
                          field.onChange(e.target.files ? e.target.files[0] : null);
                        }}
                      />
                    </FormControl>
                    <Button className="rounded-md" variant="outline" size="icon" type="submit">
                      <ArrowUp />
                    </Button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

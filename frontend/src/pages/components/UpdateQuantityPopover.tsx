import {
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
} from '@chakra-ui/react';
import { number, object } from 'yup';
import { Form, Formik } from 'formik';
import { InputControl, SubmitButton } from 'formik-chakra-ui';

export const UpdateQuantityPopover = ({
  isOpen,
  onClose,
  initialQuantity,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialQuantity: number;
  onSubmit: (quantity: number) => void;
}) => {
  const UpdateQuantitySchema = object({
    quantity: number().min(1, 'Smaller then 1 not allowed').required('Field is required'),
  });

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom">
      <PopoverContent>
        <PopoverHeader>Change Quantity</PopoverHeader>
        <PopoverCloseButton />
        <Formik
          initialValues={{ quantity: initialQuantity }}
          validationSchema={UpdateQuantitySchema}
          onSubmit={(values, formikHelpers) => {
            formikHelpers.setSubmitting(false);
            onSubmit(values.quantity);
            onClose();
          }}
          enableReinitialize={true}
        >
          <Form>
            <PopoverBody>
              <InputControl
                name={'quantity'}
                inputProps={{ type: 'number', placeholder: 'Quantity?' }}
              />
            </PopoverBody>
            <PopoverFooter>
              <SubmitButton colorScheme="blue" mr={3}>
                Change
              </SubmitButton>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </PopoverFooter>
          </Form>
        </Formik>
      </PopoverContent>
    </Popover>
  );
};

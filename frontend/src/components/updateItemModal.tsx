import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { InputControl, SubmitButton } from 'formik-chakra-ui';
import { object, string } from 'yup';

export type UpdateItemFormValues = {
  id: string;
  name: string;
  description: string;
};

export const UpdateItemModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateItemFormValues) => void;
}) => {
  const UpdateItemSchema = object({
    name: string().min(1, 'Name has to be longer than 1 character').required('Name is required'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Item: </ModalHeader>
        <ModalCloseButton />
        <Formik<UpdateItemFormValues>
          initialValues={{ id: '', name: '', description: '' }}
          validationSchema={UpdateItemSchema}
          onSubmit={(values, formikHelpers) => {
            formikHelpers.setSubmitting(false);
            onSubmit(values);
            onClose();
          }}
        >
          {() => (
            <Form>
              <ModalBody>
                <HStack spacing={3} w="full">
                  <InputControl name={'name'} label={'Name'} />
                  <InputControl name={'description'} label={'Description'} />
                </HStack>
              </ModalBody>
              <ModalFooter>
                <SubmitButton colorScheme="blue">Update Item</SubmitButton>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

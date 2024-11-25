import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  VStack,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { InputControl, SubmitButton, TextareaControl } from 'formik-chakra-ui';
import { PostShoppingListsRequest } from '../../adapter/api/__generated';
import ReactSelectControl from '../../components/ReactSelectControl.tsx';
import { GroupBase } from 'react-select';
import { OptionBase } from 'chakra-react-select';
import { useApiClient } from '../../hooks/useApiClient.ts';

interface ItemOption extends OptionBase {
  id?: string;
  label: string;
  value: string;
}

type ShoppingListFormValues = Omit<PostShoppingListsRequest, 'items'> & {
  items?: Array<ItemOption>;
};

export const CreateShoppingListModal = ({
  initialValues,
  onSubmit,
  ...restProps
}: Omit<ModalProps, 'children'> & {
  initialValues: ShoppingListFormValues | null;
  onSubmit?: (data: PostShoppingListsRequest) => void;
}) => {
  const client = useApiClient();

  return (
    <Modal {...restProps}>
      <ModalOverlay />

      <Formik<ShoppingListFormValues>
        initialValues={initialValues ?? { name: '', description: '', items: [] }}
        onSubmit={(values, formikHelpers) => {
          const transformedItems =
            values.items?.map((item) => ({
              name: item.value, // Verwende 'value' als 'name' für die API
            })) ?? [];

          const payload = {
            ...values,
            items: transformedItems,
          };

          console.log('Payload for API:', payload);

          onSubmit?.(payload);
          formikHelpers.setSubmitting(false);
        }}
      >
        <ModalContent as={Form}>
          <ModalHeader>{initialValues ? 'Update ShoppingList' : 'Create ShoppingList'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <InputControl name={'name'} label={'Name'} />
              <TextareaControl name={'description'} label={'Description'} />

              <ReactSelectControl<ItemOption, true, GroupBase<ItemOption>>
                name="items"
                label="Items"
                selectProps={{
                  isMulti: true,
                  defaultOptions: true,
                  loadOptions: async (inputValue) => {
                    const items = await client.getItems();
                    if (items.status === 200) {
                      return items.data
                        .filter((item) => item?.name?.includes(inputValue))
                        .map((item) => ({
                          id: item.id,
                          label: item.name ?? '',
                          value: item.name ?? '',
                        }));
                    }
                    return [];
                  },
                }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <SubmitButton>
              {initialValues ? 'update ShoppingList' : 'create ShoppingList'}
            </SubmitButton>
          </ModalFooter>
        </ModalContent>
      </Formik>
    </Modal>
  );
};

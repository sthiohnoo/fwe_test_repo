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
import { PostShoppingListsRequestItemsInner, ShoppingList } from '../../adapter/api/__generated';
import ReactSelectControl from '../../components/ReactSelectControl.tsx';
import { GroupBase } from 'react-select';
import { OptionBase } from 'chakra-react-select';
import { useApiClient } from '../../hooks/useApiClient.ts';

interface ItemOption extends OptionBase {
  id?: string;
  label: string;
  value: string;
}

type ShoppingListFormValues = Omit<ShoppingList, 'id' | 'createdAt' | 'isFavorite'> &
  Partial<Pick<ShoppingList, 'id'>> & {
    items?: Array<PostShoppingListsRequestItemsInner>;
  };
export const CreateShoppingListModal = ({
  initialValues,
  onSubmit,
  ...restProps
}: Omit<ModalProps, 'children'> & {
  initialValues: ShoppingListFormValues | null;
  onSubmit?: (data: ShoppingListFormValues) => void;
}) => {
  const client = useApiClient();
  return (
    <Modal {...restProps}>
      <ModalOverlay />

      <Formik<ShoppingListFormValues>
        initialValues={initialValues ?? { name: '', description: '', items: [] }}
        onSubmit={(e, formikHelpers) => {
          console.log('submit');
          onSubmit?.(e);
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
                    console.log('Items:', items);
                    if (items.status === 200) {
                      console.log('itemdaten', items.data);
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

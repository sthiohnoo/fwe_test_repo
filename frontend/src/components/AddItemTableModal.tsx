import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { useApiClient } from '../hooks/useApiClient.ts';
import { Item } from '../adapter/api/__generated';
import { InputControl, SelectControl, SubmitButton } from 'formik-chakra-ui';
import { Form, Formik } from 'formik';
import { number, object } from 'yup';

export type AddItemFormValues = {
  id: string;
  quantity: number;
  isPurchased: boolean;
};

export const AddItemTableModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddItemFormValues) => Promise<void>;
}) => {
  //const { isOpen, onOpen, onClose } = useDisclosure();

  const client = useApiClient();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const res = await client.getItems();
    setItems(res.data);
  }, [client]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
    }
  }, [isOpen]);

  const selectItem = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const AddItemSchema = object({
    quantity: number().min(1, 'Smaller then 1 not allowed').required('Field is required'),
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <Formik<AddItemFormValues>
          initialValues={{ id: '', quantity: 1, isPurchased: false }}
          validationSchema={AddItemSchema}
          onSubmit={(values, formikHelpers) => {
            formikHelpers.setSubmitting(false);
            onSubmit(values);
            onClose();
          }}
        >
          {({ setFieldValue }) => (
            <ModalContent as={Form}>
              <ModalHeader>Items</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((item) => (
                      <Tr
                        key={item.id}
                        onClick={() => {
                          selectItem(item.id);
                          setFieldValue('id', item.id);
                        }}
                        bg={selectedItem === item.id ? 'blue.100' : 'white'}
                        cursor="pointer"
                      >
                        <Td>{item.name}</Td>
                        <Td>{item.description}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <VStack spacing={3} w="full">
                  <HStack spacing={3} w="full">
                    <InputControl
                      name={'quantity'}
                      label={'Quantity'}
                      inputProps={{ placeholder: 'How many Items?' }}
                    />
                    <SelectControl name={'isPurchased'} label={'Is Purchased?'}>
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </SelectControl>
                  </HStack>
                  <SubmitButton colorScheme="blue">Add Item to ShoppingList</SubmitButton>
                </VStack>
              </ModalFooter>
            </ModalContent>
          )}
        </Formik>
      </Modal>
    </>
  );
};

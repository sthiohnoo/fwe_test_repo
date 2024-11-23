import {
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, StarIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { ShoppingList } from '../../adapter/api/__generated';
import { FaPlus } from 'react-icons/fa';

export const ShoppingListTable = ({
  data,
  onClickDeleteShoppingList,
  onClickUpdateShoppingList,
  onClickAddItemToShoppingList,
  onClickDeleteItem,
  onClickToggleFavorite,
}: {
  data: ShoppingList[];
  onClickDeleteShoppingList: (shoppingList: ShoppingList) => void;
  onClickUpdateShoppingList: (shoppingList: ShoppingList) => void;
  onClickAddItemToShoppingList: (shoppingList: ShoppingList) => void;
  onClickDeleteItem: (shoppingList: ShoppingList, itemId: string) => void;
  onClickToggleFavorite: (shoppingList: ShoppingList) => void;
}) => {
  const headerBg = useColorModeValue('lightblue', 'darkblue');
  const cellBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Items</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((entry) => {
            return (
              <Tr key={entry.id}>
                <Td>{entry.name}</Td>
                <Td>{entry.description}</Td>
                <Td>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th bg={headerBg}>Item Name</Th>
                        <Th bg={headerBg}>Item Description</Th>
                        <Th bg={headerBg}>is Purchased</Th>
                        <Th bg={headerBg}>Quantity</Th>
                        <Th bg={headerBg}></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {entry.shoppingListItems?.map((item) => (
                        <Tr key={item.item?.id}>
                          <Td bg={cellBg}>{item.item?.name}</Td>
                          <Td bg={cellBg}>{item.item?.description}</Td>
                          <Td bg={cellBg}>{item.isPurchased?.toString()}</Td>
                          <Td bg={cellBg}>{item.quantity}</Td>
                          <Td bg={cellBg}>
                            <IconButton
                              aria-label={'Delete Item'}
                              icon={<DeleteIcon />}
                              onClick={() => {
                                if (item.item?.id) {
                                  onClickDeleteItem(entry, item.item.id);
                                }
                              }}
                            />{' '}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Td>
                <Td>{format(new Date(entry.createdAt), 'dd.MM.yyyy')}</Td>
                <Td>
                  <IconButton
                    aria-label={'Toggle Favortie'}
                    icon={<StarIcon color={entry.isFavorite ? 'yellow.400' : 'black'} />}
                    onClick={() => onClickToggleFavorite(entry)}
                  />{' '}
                  <IconButton
                    aria-label={'Update ShoppingList'}
                    icon={<EditIcon />}
                    onClick={() => onClickUpdateShoppingList(entry)}
                  />{' '}
                  <IconButton
                    aria-label={'Add Item to ShoppingList'}
                    icon={<FaPlus />}
                    onClick={() => onClickAddItemToShoppingList(entry)}
                  />{' '}
                  <IconButton
                    aria-label={'Delete ShoppingList'}
                    icon={<DeleteIcon />}
                    onClick={() => onClickDeleteShoppingList(entry)}
                  />{' '}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

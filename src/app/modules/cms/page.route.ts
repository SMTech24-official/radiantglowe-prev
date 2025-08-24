import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { PageController } from './page.controller';
import { pageValidationSchemas } from './page.validation';

const router = Router();

router.post(
  '/:pageName',
  auth('admin'),
  PageController.createPage
);
router.get('/:pageName', PageController.getPage);
router.patch(
  '/:pageName',
  auth('admin'),
  PageController.updatePage
);
router.delete('/:pageName', auth('admin'), PageController.deletePage);

export const PageRoutes = router;